package controllers

import controllers.common.PaginatedResult
import db.Database
import javax.inject._
import models.blog.Article
import play.api.Logger
import play.api.mvc._
import utils.WebUtils

import scala.concurrent.ExecutionContext

@Singleton
class ArticleController @Inject()(cc: ControllerComponents, db: Database)
  extends AbstractController(cc) {

  private final val log = Logger(this.getClass)
  private final val MAX_PAGE_SIZE = 100;

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  def article(id: String) = Action.async { implicit request: Request[AnyContent] =>
    db.find[Article](id)
      .map(WebUtils.asHttp(_))
  }

  def all(page: Int, requestedPageSize: Int) = Action.async { implicit request: Request[AnyContent] =>
    val pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE)
    if (pageSize != requestedPageSize) {
      log.error(s"The requested page size is too big: ${requestedPageSize} with max set to ${MAX_PAGE_SIZE}, overriding")
    }
    db.findPage[Article](page, pageSize)
      .map(Ok[PaginatedResult[Article]])
  }

  def update(id: String) = Action.async(Article.jsonParser) { implicit request: Request[Article] =>
    db.update(id, request.body)
      .map(Ok[Article])
  }

  def delete(id: String) = Action.async { implicit request: Request[AnyContent] =>
    db.delete[Article](id)
      .map(_ => Ok(""))
  }
}
