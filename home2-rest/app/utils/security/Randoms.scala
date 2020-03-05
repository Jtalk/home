package utils.security

import java.security.SecureRandom

import scala.util.Random

object Randoms {
    lazy val random: Random = new SecureRandom();

    def newToken(): String = random.nextString(512)
}
