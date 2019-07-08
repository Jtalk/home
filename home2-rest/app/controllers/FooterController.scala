package controllers

import db.Database
import javax.inject._
import models.footer.FooterLink._
import models.footer._
import play.api.libs.json._
import play.api.mvc._
import utils.Extension.FutureOption
import utils.WebUtils

import scala.concurrent.ExecutionContext

@Singleton
class FooterController @Inject()(cc: ControllerComponents, db: Database)
  extends AbstractController(cc) {

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  def loadFooter(): Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    db.findSingle[Footer]
      .map(WebUtils.asHttp(_))
  }

  def loadFooterLinks(): Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    db.findSingle[Footer]
      .fomap(_.links)
      .fomap(Json.toJson[Seq[FooterLink]])
      .map(WebUtils.asHttp(_))
  }

  def loadFooterLogos(): Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    db.findSingle[Footer]
      .fomap(_.logos)
      .fomap(Json.toJson[Seq[FooterLogo]])
      .map(WebUtils.asHttp(_))
  }
}
