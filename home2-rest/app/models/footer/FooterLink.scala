package models.footer

import play.api.http.Writeable
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{JsPath, Json, Reads, Writes}
import play.api.mvc.PlayBodyParsers
import utils.WebUtils

import scala.concurrent.ExecutionContext

case class FooterLink(caption: String, href: String) {
}

object FooterLink {

  implicit val jsonWriter: Writes[FooterLink] = Json.writes[FooterLink]
  implicit val jsonWriteable: Writeable[FooterLink] = Writeable.writeableOf_JsValue.map[FooterLink](Json.toJson _)
  implicit val jsonReader: Reads[FooterLink] = (
    (JsPath \ "caption").read(minLength[String](1)) and
      (JsPath \ "href").read(minLength[String](1)))
    .apply(FooterLink.apply _)


  implicit def jsonParser(implicit bodyParsers: PlayBodyParsers, ec: ExecutionContext) = WebUtils.bodyParser[FooterLink]

}