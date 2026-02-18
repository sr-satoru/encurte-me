from prisma import Prisma

db = Prisma()

async def connect_db():
    if not db.is_connected():
        await db.connect()

async def disconnect_db():
    if db.is_connected():
        await db.disconnect()

# Dependency for FastAPI
async def get_db():
    if not db.is_connected():
        await db.connect()
    return db
