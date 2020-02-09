package controllers

import db.Database
import javax.inject._
import models.owner.OwnerInfo
import play.api.libs.json.{JsBoolean, JsObject}
import play.api.mvc._
import utils.Extension.FutureOption
import utils.WebUtils

import scala.concurrent.ExecutionContext

@Singleton
class OwnerController @Inject()(cc: ControllerComponents, db: Database)
  extends AbstractController(cc) {

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  def name() = Action.async { implicit request: Request[AnyContent] =>
    db.findSingle[OwnerInfo]
      .fomap(_.name)
      .map(WebUtils.asHttp(_))
  }

  def info() = Action.async { implicit request: Request[AnyContent] =>
    db.findSingle[OwnerInfo]
      .map(WebUtils.asHttp(_))
  }

  def bio() = Action.async { implicit request: Request[AnyContent] =>
    db.findSingle[OwnerInfo]
      .fomap(_.bio)
      .map(WebUtils.asHttp(_))
  }

  def update() = Action.async(OwnerInfo.jsonParser) { implicit request: Request[OwnerInfo] =>
    db.updateSingle(request.body)
      .map(Ok[OwnerInfo])
  }
}
