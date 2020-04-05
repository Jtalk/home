package controllers

import java.time.Clock

import controllers.common.Authenticating
import db.Database
import javax.inject._
import models.footer.FooterLink._
import models.footer._
import play.api.Configuration
import play.api.libs.json._
import play.api.mvc._
import utils.Extension.FutureOption
import utils.WebUtils

import scala.concurrent.ExecutionContext

@Singleton
class FooterController @Inject()(cc: ControllerComponents,
                                 implicit val db: Database,
                                 implicit val clock: Clock,
                                 implicit val config: Configuration)
  extends AbstractController(cc) with Authenticating {

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

  def update(): Action[Footer] = AuthenticatedAction.async(Footer.jsonParser) { _ => implicit request: Request[Footer] =>
    db.updateSingle[Footer](request.body)
      .map(Ok[Footer])
  }
}
