package controllers

import java.time.Clock

import controllers.common.{Authenticating, PaginatedResult}
import db.Database
import javax.inject._
import models.blog.Article
import play.api.libs.json.Json
import play.api.mvc._
import play.api.{Configuration, Logger}
import utils.WebUtils

import scala.concurrent.ExecutionContext
import utils.Extension._

@Singleton
class ArticleController @Inject()(cc: ControllerComponents,
                                  val db: Database,
                                  val clock: Clock,
                                  val config: Configuration)
  extends AbstractController(cc) with Authenticating {

  private final val log = Logger(this.getClass)
  private final val MAX_PAGE_SIZE = 200;

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  def article(id: String) = Action.async { implicit request: Request[AnyContent] =>
    db.find[Article](id)
      .map(WebUtils.asHttp(_))
  }

  def all(page: Int, requestedPageSize: Int, published: Boolean) = Action.async { implicit request: Request[AnyContent] =>
    val pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE)
    if (pageSize != requestedPageSize) {
      log.error(s"The requested page size is too big: ${requestedPageSize} with max set to ${MAX_PAGE_SIZE}, overriding")
    }
    val filter = if (published) Json.obj("published" -> true) else Json.obj()
    val sorter = Json.obj("created" -> -1)
    db.findPage[Article](page, pageSize, filter, sorter)
      .map(Ok[PaginatedResult[Article]])
  }

  def update(id: String) = AuthenticatedAction.async(Article.jsonParser) { _ => request: Request[Article] =>
    val update = db.find[Article](id)
      .fomap(existing => request.body.copy(atomId = existing.atomId))
      .foget(request.body)
      .map(_.copy(updated = now))
    update
      .flatMap(db.update(id, _))
      .map(Ok[Article])
  }

  def delete(id: String) = AuthenticatedAction.async { _ => _ =>
    db.delete[Article](id)
      .map(_ => Ok(""))
  }
}
