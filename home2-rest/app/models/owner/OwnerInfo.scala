package models.owner

import java.time.{ZoneOffset, ZonedDateTime}
import java.util.UUID

import models.ModelType
import models.ModelType.ModelType
import models.search.Searchable
import play.api.http.Writeable
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._
import play.api.mvc._
import utils.WebUtils

import scala.concurrent.ExecutionContext

case class OwnerInfo(name: String,
                     nickname: String,
                     description: String,
                     photoId: String,
                     bio: String,
                     contacts: Map[String, Contact],
                     atomId: UUID,
                     updated: ZonedDateTime,
                    ) extends Searchable {
}

object OwnerInfo {

  implicit val model: ModelType[OwnerInfo] = ModelType.OWNER
  implicit val jsonWriter: OWrites[OwnerInfo] = Json.writes[OwnerInfo]
  implicit val jsonWriteable: Writeable[OwnerInfo] = Writeable.writeableOf_JsValue.map[OwnerInfo](Json.toJson _)
  implicit val jsonReader: Reads[OwnerInfo] = (
    (JsPath \ "name").read(minLength[String](1)) and
      (JsPath \ "nickname").read[String] and
      (JsPath \ "description").read[String] and
      (JsPath \ "photoId").read[String] and
      (JsPath \ "bio").read[String] and
      (JsPath \ "contacts").read[Map[String, Contact]] and
      (JsPath \ "atomId").read[UUID] and
      (JsPath \ "updated").readWithDefault[ZonedDateTime](ZonedDateTime.now(ZoneOffset.UTC)))
    .apply(OwnerInfo.apply _)


  implicit def jsonParser(implicit bodyParsers: PlayBodyParsers, ec: ExecutionContext) = WebUtils.bodyParser[OwnerInfo]

}