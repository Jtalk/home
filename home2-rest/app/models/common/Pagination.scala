package models.common

import play.api.http.Writeable
import play.api.libs.json.{Json, Writes}

case class Pagination(total: Int, current: Int) {
}

object Pagination {
  implicit val jsonWriter: Writes[Pagination] = Json.writes[Pagination]
  implicit val jsonWriteable: Writeable[Pagination] = Writeable.writeableOf_JsValue.map[Pagination](Json.toJson _)
}