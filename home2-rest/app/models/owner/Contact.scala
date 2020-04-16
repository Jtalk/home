package models.owner

import play.api.libs.json.{Json, Reads, Writes}

// We want to be able to add arbitrary metadata to contact details in future, hence the single-field class
case class Contact(value: String) {
}

object Contact {
  implicit val jsonWriter: Writes[Contact] = Json.writes[Contact]
  implicit val jsonReader: Reads[Contact] = Json.reads[Contact]
}