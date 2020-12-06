package controllers

import java.time.format.DateTimeFormatter
import java.time.{Clock, ZonedDateTime}

import controllers.common.Authenticating
import db.Database
import javax.inject.Inject
import models.blog.Article
import models.owner.{Contact, OwnerInfo}
import play.api.libs.json.Json
import play.api.{Configuration, Logger}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents, PlayBodyParsers, Request}
import utils.Extension._

import scala.concurrent.{ExecutionContext, Future}
import scala.xml.{Elem, NodeBuffer}

class FeedController @Inject()(cc: ControllerComponents,
                               val db: Database,
                               val config: Configuration)
  extends AbstractController(cc) {

  private final val log = Logger(this.getClass)
  private final val AtomPageSize = 20;
  private final val DateTimeFormat = DateTimeFormatter.ISO_OFFSET_DATE_TIME

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  private lazy val selfUrl = config.get[String]("app.feed.atom.url")
  private lazy val articleUrl = config.get[String]("app.feed.atom.entry.url.base")

  private val filter = Json.obj("published" -> true)
  private val sorter = Json.obj("created" -> -1)

  def atom: Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    db.findPage[Article](0, AtomPageSize, filter, sorter)
      .map(_.data)
      .flatMap(articles => owner.map((_, articles)))
      .map((asAtom _).tupled)
      .map(Ok(_))
      .map(_.withHeaders(CACHE_CONTROL -> "max-age=3600"))
  }

  private def owner: Future[OwnerInfo] = db.findSingle[OwnerInfo]
    .liftMissing(new RuntimeException("No owner data found in the database"))
  private def updatedAt(owner: OwnerInfo, articles: Seq[Article]): String = articles.map(_.updated)
    .+:(owner.updated)
    .sorted(Ordering.fromLessThan[ZonedDateTime](_ isBefore _))
    .head |> toAtomDate

  private def toAtomDate(dateTime: ZonedDateTime): String = DateTimeFormat.format(dateTime)

  private def articleLink(id: String): String = s"${articleUrl}/${id}"

  private def extractSummary(content: String): String = {
    val splitPreview = content.split("</?preview>", 3)
    if (splitPreview.length != 3) {
      "Preview not available"
    } else {
      splitPreview(1)
    }
  }

  private def asAtom(owner: OwnerInfo, articles: Seq[Article]): Elem =
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>{owner.name}'s Blog</title>
      <link href={selfUrl} rel="self"/>
      <id>urn:uuid:{owner.atomId}</id>
      <updated>{updatedAt(owner, articles)}</updated>
      {
        for (article <- articles) yield {
        <entry>
          <title>{article.title}</title>
          <link rel="alternate" href={articleLink(article.id)}/>
          <id>urn:uuid:{article.atomId}</id>
          <updated>{toAtomDate(article.updated)}</updated>
          <summary>{extractSummary(article.content)}</summary>
          <author>
            <name>{owner.name}</name>
            <email>{owner.contacts.withDefault(_ => Contact(""))("email").value}</email>
          </author>
        </entry>
        }
      }
    </feed>
}
