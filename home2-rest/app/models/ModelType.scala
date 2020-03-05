package models

import models.authentication.{Authentication, Session}
import models.blog.Article
import models.footer.Footer
import models.owner.OwnerInfo
import models.project.Project

object ModelType extends Enumeration {
  protected case class Val[T](tableName: String) extends super.Val {}
  type ModelType[T] = Val[T]
  final val AUTHENTICATION = Val[Authentication]("authentication")
  final val SESSION = Val[Session]("session")
  final val OWNER = Val[OwnerInfo]("owner")
  final val PROJECT = Val[Project]("projects")
  final val ARTICLE = Val[Article]("articles")
  final val FOOTER = Val[Footer]("footer")
}
