package controllers

import javax.inject._
import models.owner.{Contact, ContactType, OwnerInfo}
import play.api.mvc._

@Singleton
class OwnerController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  def getInfo() = Action { implicit request: Request[AnyContent] =>
    val info = OwnerInfo("Test Owner", "towner", "Some text about him", List(Contact(ContactType.EMAIL, "test@example.com")))
    Ok(info)
  }
}
