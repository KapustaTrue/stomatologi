# python3 shot.py out.png "f=FMA52738&az=90&el=0&w=1000&h=800" [...more pairs]
import asyncio, sys, base64
from playwright.async_api import async_playwright
async def main(pairs):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 1200})
        for out, qs in pairs:
            await pg.goto(f'http://localhost:8766/render.html?{qs}')
            await pg.wait_for_function('window.done === true', timeout=60000)
            data = await pg.evaluate("document.querySelector('canvas').toDataURL('image/png')")
            open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
            print(out, await pg.evaluate('JSON.stringify(window.bbox)'))
        await b.close()
a = sys.argv[1:]
asyncio.run(main(list(zip(a[::2], a[1::2]))))
