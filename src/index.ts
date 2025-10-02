import "dotenv/config";
import debug from "debug";
import { z } from "zod";

const log = debug("myapp");

// ! Basic
// * Creating a schema for strings
const s1 = z.string();

// ! Parsing
// log(s1.parse("tuna")); // => "tuna"
// s1.parse(12); // => throws ZodError

// ! Safe parsing
// * "safe" parsing (doesn't throw error if validation fails)
// log(JSON.stringify(s1.safeParse("tuna"), null, 2));
// log(JSON.stringify(s1.safeParse(12), null, 2));

// ! Object
const s2 = z.object({
  username: z.string(),
});
// log(s2.safeParse({ username: "Ludwig" }));

// ! Type extraction
// * Extract the inferred type
type S2 = z.infer<typeof s2>;

// ! More complicated object
const s3 = z.object({
  id: z.string().min(1, { message: "Missing ID" }),
  createdAt: z.number(),
  email: z.string().email({ message: "Invalid email" }),
});
const s3Test = {
  id: "1234",
  createdAt: new Date().getTime(),
  email: "test@example.com",
  extra: "Should be removed",
};
// log(JSON.stringify(s3.safeParse(s3Test), null, 2)); // Remove extra field too.

// ! Date parse (regex)
const s4 = z
  .string()
  .regex(
    /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/,
    "User format YYYY-MM-DD"
  );
// log(JSON.stringify(s4.safeParse("2021-01-01"), null, 2));

// ! Date parse (general format)
const s5 = z
  .string()
  .refine((s) => z.coerce.date().safeParse(s).success, "Invalid date");
// log(JSON.stringify(s5.safeParse("10-10-2024"), null, 2));
// log(JSON.stringify(s5.safeParse("10/10/2024"), null, 2));
// log(JSON.stringify(s5.safeParse("2024-10-10"), null, 2));
// log(JSON.stringify(s5.safeParse("October 10 2024"), null, 2));
// log(JSON.stringify(s5.safeParse("10 October 2024"), null, 2));
// log(JSON.stringify(s5.safeParse("10 Oct 24"), null, 2));

// ! Advanced string usage
const s6 = z
  .string()
  .refine((s) => z.coerce.date().safeParse(s).success, "Invalid date")
  .refine((d) => new Date(d) <= new Date(), "Cannot use future date.");
// log(JSON.stringify(s6.safeParse("2021-01-01"), null, 2));
// log(JSON.stringify(s6.safeParse("2025-01-01"), null, 2));

// ! Validate with 2 fields
const s7 = z
  .object({
    password: z.string().min(1, "Password too short"),
    confirmPassword: z.string().min(1, "Confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
const s7Test = {
  password: "1234",
  confirmPassword: "12345",
};
// log(JSON.stringify(s7.safeParse(s7Test), null, 2));

// ! Modifying existing schema
const s8 = z.object({
  first: z.string(),
});
const s8Mod = s8.omit({ first: true }).extend({ second: z.string() });
const s8Test = {
  first: "First",
  second: "Second",
};
// log(s8.safeParse(s8Test));
// log(s8Mod.safeParse(s8Test));
