package models.common

import play.api.http.Writeable
import play.api.libs.json.{Json, Writes}

case class Pagination(total: Int, current: Int, pageSize: Int) {
}

object Pagination {
  def fromTotalCount(totalCount: Long, pageSize: Int, currentPage: Int): Pagination = Pagination(
    total = Math.ceil(totalCount.toDouble / pageSize).toInt,
    current = currentPage,
    pageSize = pageSize)

  implicit val jsonWriter: Writes[Pagination] = Json.writes[Pagination]
  implicit val jsonWriteable: Writeable[Pagination] = Writeable.writeableOf_JsValue.map[Pagination](Json.toJson _)
}