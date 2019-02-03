package models.owner

import play.api.http.Writeable
import play.api.libs.json.{Json, Writes}

case class OwnerInfo(name: String, nickname: String, description: String, contacts: List[Contact]) {
}

object OwnerInfo {
  implicit val jsonWriter: Writes[OwnerInfo] = Json.writes[OwnerInfo]
  implicit val jsonWriteable: Writeable[OwnerInfo] = Writeable.writeableOf_JsValue.map[OwnerInfo](Json.toJson _)
}