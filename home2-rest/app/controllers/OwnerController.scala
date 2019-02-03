package controllers

import javax.inject._
import models.owner.{Contact, ContactType, OwnerInfo}
import play.api.mvc._

@Singleton
class OwnerController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  def name() = Action { implicit request: Request[AnyContent] =>
    val name = "Test Owner"
    Ok(name)
  }

  def info() = Action { implicit request: Request[AnyContent] =>
    val info = OwnerInfo("Test Owner", "towner", "Some text about him", List(Contact(ContactType.EMAIL, "test@example.com")))
    Ok(info)
  }

  def bio() = Action { implicit request: Request[AnyContent] =>
    val bio =
      "[h1]Super Header [abbr title=\"Lenghty explanation\"]LE[/abbr][/h1][p]Sed ut perspiciatis unde omnis iste natus error " +
        "sit voluptatem accusantium doloremque laudantium,totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et " +
        "quasi architecto beatae vitaedicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit " +
        "aut fugit,sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquamest, qui " +
        "dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eiusmodi tempora incidunt ut labore " +
        "et dolore magnam aliquam quaerat voluptatem. Ut enim ad minimaveniam, quis nostrum exercitationem ullam corporis suscipit " +
        "laboriosam, nisi ut aliquid ex eacommodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse " +
        "quam nihilmolestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?[/p]"
    Ok(bio);
  }
}
