package models.footer

import models.ModelType
import models.ModelType.ModelType
import play.api.http.Writeable
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{JsPath, Json, Reads, Writes}
import play.api.mvc.PlayBodyParsers
import utils.WebUtils

import scala.concurrent.ExecutionContext

case class Footer(links: Seq[FooterLink], logos: Seq[FooterLogo]) {
}

object Footer {

  implicit val model: ModelType[Footer] = ModelType.FOOTER
  implicit val jsonWriter: Writes[Footer] = Json.writes[Footer]
  implicit val jsonWriteable: Writeable[Footer] = Writeable.writeableOf_JsValue.map[Footer](Json.toJson _)
  implicit val jsonReader: Reads[Footer] = (
    (JsPath \ "links").read[Seq[FooterLink]] and
      (JsPath \ "logos").read[Seq[FooterLogo]])
    .apply(Footer.apply _)


  implicit def jsonParser(implicit bodyParsers: PlayBodyParsers, ec: ExecutionContext) = WebUtils.bodyParser[Footer]

}