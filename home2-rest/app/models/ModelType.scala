package models

import models.footer.Footer
import models.owner.OwnerInfo

object ModelType extends Enumeration {
  protected case class Val[T](tableName: String) extends super.Val {}
  type ModelType[T] = Val[T]
  val OWNER = Val[OwnerInfo]("owner")
  val FOOTER = Val[Footer]("footer")
}
