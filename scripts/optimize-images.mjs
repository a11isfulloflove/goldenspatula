import { readdir, readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const TARGET_SIZE = 96

const directories = ['public/items', 'public/champs']

for (const directory of directories) {
  const files = (await readdir(directory)).filter((file) => file.endsWith('.png'))
  let before = 0
  let after = 0
  for (const file of files) {
    const path = `${directory}/${file}`
    const input = await readFile(path)
    before += input.byteLength
    const output = await sharp(input)
      .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'inside' })
      .png({ palette: true, compressionLevel: 9 })
      .toBuffer()
    if (output.byteLength < input.byteLength) {
      await writeFile(path, output)
      after += output.byteLength
    } else {
      after += input.byteLength
    }
  }
  console.log(
    `${directory}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (${files.length} files)`,
  )
}
