package utils.security

import java.util

import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import play.api.Logger

import scala.util.{Failure, Success}

case class PBKDF2(algorithm: String) extends PasswordHasher with PasswordChecker {

  lazy final val log = Logger(getClass)

  override def hash(password: String): String = {
    val salt: Array[Byte] = generateSalt
    val hash: Array[Byte] = createHash(password, salt)
    val sp = SaltedPassword(hash, salt)
    sp.pack
  }

  override def check(password: String, hash: String): Boolean = {
    SaltedPassword.unpack(hash) match {
      case Success(SaltedPassword(expectedHash, salt)) =>
        val actualHash = createHash(password, salt)
        util.Arrays.equals(expectedHash, actualHash)
      case Failure(e) => log.error("Cannot unpack password salt", e); false
    }
  }

  private def keySpec(password: Array[Char], salt: Array[Byte]) = new PBEKeySpec(password, salt, 65536, 512)

  private def generateSalt = {
    val sr = Randoms.random
    val salt = Array.ofDim[Byte](32)
    sr.nextBytes(salt)
    salt
  }

  private def createHash(password: String, salt: Array[Byte]) = {
    val ks = keySpec(password.toCharArray, salt)
    val factory = SecretKeyFactory.getInstance(algorithm)
    val result = factory.generateSecret(ks).getEncoded
    result
  }
}
