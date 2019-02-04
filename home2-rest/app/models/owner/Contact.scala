package models.owner

import play.api.libs.json.{Json, Reads, Writes}

case class Contact(contactType: String, value: String) {
}

object Contact {
  implicit val jsonWriter: Writes[Contact] = Json.writes[Contact]
  implicit val jsonReader: Reads[Contact] = Json.reads[Contact]
}