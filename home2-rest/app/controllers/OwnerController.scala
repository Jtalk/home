package controllers

import db.Database
import javax.inject._
import models.owner.OwnerInfo
import play.api.mvc._
import utils.WebUtils

import scala.concurrent.ExecutionContext

@Singleton
class OwnerController @Inject()(cc: ControllerComponents, db: Database)
  extends AbstractController(cc) {

  implicit def ec: ExecutionContext = cc.executionContext

  def name() = Action.async { implicit request: Request[AnyContent] => db.findSingle[OwnerInfo]
      .map(_.map(_.name))
      .map(WebUtils.asHttp[String](_))
  }

  def info() = Action.async { implicit request: Request[AnyContent] => db.findSingle[OwnerInfo]
    .map(WebUtils.asHttp[OwnerInfo](_))
  }

    def bio() = Action.async { implicit request: Request[AnyContent] => db.findSingle[OwnerInfo]
    .map(_.map(_.bio))
    .map(WebUtils.asHttp[String](_))
  }

}
