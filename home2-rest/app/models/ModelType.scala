package models

import models.authentication.{Authentication, Session}
import models.blog.Article
import models.footer.Footer
import models.owner.OwnerInfo
import models.project.Project

object ModelType extends Enumeration {
  protected case class Val[T](tableName: String, `type`: String) extends super.Val {}
  type ModelType[T] = Val[T]
  final val AUTHENTICATION = Val[Authentication]("authentication", "authentication")
  final val SESSION = Val[Session]("session", "session")
  final val OWNER = Val[OwnerInfo]("owner", "owner")
  final val PROJECT = Val[Project]("projects", "project")
  final val ARTICLE = Val[Article]("articles", "article")
  final val FOOTER = Val[Footer]("footer", "footer")
}
