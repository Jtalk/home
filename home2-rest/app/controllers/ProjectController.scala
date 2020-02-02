package controllers

import db.Database
import javax.inject._
import models.project.Project
import play.api.mvc._
import play.api.libs.json._
import utils.WebUtils

import scala.concurrent.ExecutionContext

@Singleton
class ProjectController @Inject()(cc: ControllerComponents, db: Database)
  extends AbstractController(cc) {

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  def project(id: String) = Action.async { implicit request: Request[AnyContent] =>
    db.find[Project](id)
      .map(WebUtils.asHttp(_))
  }

  def all() = Action.async { implicit request: Request[AnyContent] =>
    db.findAll[Project]
      .map(Json.toJson(_))
      .map(Ok.apply(_))
  }
}
