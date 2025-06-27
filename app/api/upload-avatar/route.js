import { promises as fs } from "fs"
import path from "path"

export const config = {
    api: {
        bodyParser: false,
    },
}

export async function POST(req) {
    const formidable = (await import("formidable")).default
    const form = formidable({
        maxFileSize: 5 * 1024 * 1024, // 5MB
        uploadDir: path.join(process.cwd(), "public", "avatar"),
        keepExtensions: true,
        multiples: false,
    })
    await fs.mkdir(path.join(process.cwd(), "public", "avatar"), {
        recursive: true,
    })
    return new Promise((resolve) => {
        form.parse(req, async (err, fields, files) => {
            if (err) {
                resolve(
                    new Response(
                        JSON.stringify({ error: "Gagal upload file" }),
                        { status: 400 }
                    )
                )
                return
            }
            const file = files.file
            if (!file) {
                resolve(
                    new Response(
                        JSON.stringify({ error: "File tidak ditemukan" }),
                        { status: 400 }
                    )
                )
                return
            }
            const ext = path.extname(file.originalFilename).toLowerCase()
            if (![".jpg", ".jpeg", ".png"].includes(ext)) {
                resolve(
                    new Response(
                        JSON.stringify({ error: "Format file harus JPG/PNG" }),
                        { status: 400 }
                    )
                )
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                resolve(
                    new Response(
                        JSON.stringify({ error: "Ukuran file maksimal 5MB" }),
                        { status: 400 }
                    )
                )
                return
            }
            const filename = `${Date.now()}_${file.newFilename}`
            const dest = path.join(process.cwd(), "public", "avatar", filename)
            await fs.rename(file.filepath, dest)
            const url = `/avatar/${filename}`
            resolve(new Response(JSON.stringify({ url }), { status: 200 }))
        })
    })
}
