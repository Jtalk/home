package models.owner

object ModelType extends Enumeration {
  protected case class Val[T](tableName: String) extends super.Val {}
  type ModelType[T] = Val[T]
  val OWNER = Val[OwnerInfo]("owner")
}
