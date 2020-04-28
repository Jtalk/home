package controllers

import db.Database
import javax.inject._
import models.blog.Article
import models.owner.OwnerInfo
import play.api.Logger
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._

import scala.concurrent.ExecutionContext

@Singleton
class StatusController @Inject()(cc: ControllerComponents, db: Database)
  extends AbstractController(cc) {

  private final val log = Logger(this.getClass)

  implicit private def ec: ExecutionContext = cc.executionContext

  def status(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok("UP")
  }

  def ready(): Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    db.findSingle[OwnerInfo]
      .map(_ => Ok("UP"))
      .recover {
        case e =>
          log.error("The database is unreachable", e)
          ServiceUnavailable("DOWN")
      }
  }
}
