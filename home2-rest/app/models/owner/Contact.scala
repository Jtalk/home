package models.owner

import models.owner.ContactType.ContactType
import play.api.libs.json.{Json, Writes}

case class Contact(contactType: ContactType, value: String) {
}

object Contact {
  implicit val jsonWriter: Writes[Contact] = Json.writes[Contact]
}