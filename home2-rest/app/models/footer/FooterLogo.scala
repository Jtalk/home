package models.footer

import play.api.http.Writeable
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{JsPath, Json, Reads, Writes}
import play.api.mvc.PlayBodyParsers
import utils.WebUtils

import scala.concurrent.ExecutionContext

case class FooterLogo(name: String, src: String, href: Option[String]) {
}

object FooterLogo {

  implicit val jsonWriter: Writes[FooterLogo] = Json.writes[FooterLogo]
  implicit val jsonWriteable: Writeable[FooterLogo] = Writeable.writeableOf_JsValue.map[FooterLogo](Json.toJson _)
  implicit val jsonReader: Reads[FooterLogo] = (
    (JsPath \ "name").read(minLength[String](1)) and
      (JsPath \ "src").read(minLength[String](1)) and
      (JsPath \ "href").read(optionWithNull[String]))
    .apply(FooterLogo.apply _)


  implicit def jsonParser(implicit bodyParsers: PlayBodyParsers, ec: ExecutionContext) = WebUtils.bodyParser[FooterLogo]

}