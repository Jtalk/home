package controllers

import java.time.format.DateTimeFormatter
import java.time.{Instant, ZoneId}

import db.Database
import javax.inject._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import utils.WebUtils

import scala.concurrent.ExecutionContext

@Singleton
class LoggerController @Inject()(cc: ControllerComponents, db: Database)
  extends AbstractController(cc) {

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  val logger = Logger("ui")

  def post() = Action(Events.jsonParser) { implicit request: Request[Events] =>
    request.body.events.foreach(this.log)
    Created("")
  }

  private def log(e: Event): Unit = pickLogger(e.level)(format(e))
  private def pickLogger(level: String): String => Unit = level match {
    case "ERROR" => m => logger.error(m)
    case "DEBUG" => m => logger.debug(m)
    case "INFO" => m => logger.info(m)
    case _ => m => logger.error(m) // To draw attention
  }
  private def format(e: Event) = e.exception
    .map(formatEx)
    .map(formatSimple(e) + "\n" + _)
    .getOrElse(formatSimple(e))
  private def formatEx(ex: ExceptionInfo) = s"[${ex.url}] ${ex.name} - ${ex.message}${ex.useragent.map(" (" + _ + ")").getOrElse("")}\n" + formatStacktrace(ex.stack)
  private def formatStacktrace(stack: Seq[String]) = Some(stack).filter(_.nonEmpty).map(_.reduce(_ + "\n" + _)).getOrElse("")
  private def formatSimple(e: Event): String = s"${formatTime(e.timestamp)} [${e.level}] ${e.scope} - ${e.message}"
  private def formatTime(timestamp: Instant) = timestamp.atZone(ZoneId.of("UTC")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm:ss.S"))
}

case class Events(events: Seq[Event])
case class Event(message: String, scope: String, level: String, timestamp: Instant, exception: Option[ExceptionInfo])
case class ExceptionInfo(name: String, message: String, url: String, useragent: Option[String], stack: Seq[String])
object Events {
  implicit val reads: Reads[Events] = Json.reads[Events]
  implicit def jsonParser(implicit bodyParsers: PlayBodyParsers, ec: ExecutionContext): BodyParser[Events] = WebUtils.bodyParser[Events]
}
object Event {
  implicit val reads: Reads[Event] = Json.reads[Event]
}
object ExceptionInfo {
  implicit val reads: Reads[ExceptionInfo] = Json.reads[ExceptionInfo]
}