package models.owner

import models.owner.ModelType.ModelType
import play.api.http.Writeable
import play.api.libs.json.{Json, Reads, Writes}

case class OwnerInfo(name: String, nickname: String, description: String, bio: String, contacts: List[Contact]) {
}

object OwnerInfo {
  implicit val jsonWriter: Writes[OwnerInfo] = Json.writes[OwnerInfo]
  implicit val jsonWriteable: Writeable[OwnerInfo] = Writeable.writeableOf_JsValue.map[OwnerInfo](Json.toJson _)
  implicit val jsonReader: Reads[OwnerInfo] = Json.reads[OwnerInfo]
  implicit val model: ModelType[OwnerInfo] = ModelType.OWNER
}