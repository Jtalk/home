package controllers

import db.Database
import javax.inject._
import models.blog.Article
import play.api.Logger
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._

import scala.concurrent.ExecutionContext

@Singleton
class TagsController @Inject()(cc: ControllerComponents, db: Database)
  extends AbstractController(cc) {

  private final val log = Logger(this.getClass)

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  def all() = Action.async { implicit request: Request[AnyContent] =>
    db.findMerged[Article, Set[String], String](_.tags)
      .map(Json.toJson[Set[String]])
      .map(Ok[JsValue])
  }
}
