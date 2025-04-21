-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_identifier_fkey" FOREIGN KEY ("identifier") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
