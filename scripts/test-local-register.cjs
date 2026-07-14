const bcrypt = require("bcryptjs")
const fs = require("fs").promises
const path = require("path")

const STORE_PATH = path.join(process.cwd(), "data", "local-users.json")

async function main() {
  const email = `silent12@gmail.com`
  const store = { nextId: 1, users: [] }
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8")
    Object.assign(store, JSON.parse(raw))
  } catch {
    /* baru */
  }

  const normalized = email.toLowerCase()
  if (store.users.some((u) => u.email === normalized)) {
    console.log("User already exists in local store — OK for login test")
    return
  }

  const passwordHash = await bcrypt.hash("Silent12", 10)
  const user = {
    id: store.nextId,
    nama: "silent",
    email: normalized,
    passwordHash,
    peran: "ADMIN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  store.users.push(user)
  store.nextId += 1
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2))
  console.log("Created local user:", normalized, "id: local-" + user.id)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
