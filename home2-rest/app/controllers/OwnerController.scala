package controllers

import java.time.Clock

import controllers.common.Authenticating
import db.Database
import javax.inject._
import models.owner.OwnerInfo
import play.api.Configuration
import play.api.libs.json.{JsBoolean, JsObject}
import play.api.mvc._
import utils.Extension.FutureOption
import utils.WebUtils

import scala.concurrent.ExecutionContext

@Singleton
class OwnerController @Inject()(cc: ControllerComponents,
                                val config: Configuration,
                                val clock: Clock,
                                val db: Database)
  extends AbstractController(cc) with Authenticating {

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

  def update() = AuthenticatedAction.async(OwnerInfo.jsonParser) { _ => request: Request[OwnerInfo] =>
    db.updateSingle(request.body)
      .map(Ok[OwnerInfo])
  }
}
