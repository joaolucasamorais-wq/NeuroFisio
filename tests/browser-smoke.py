from playwright.sync_api import sync_playwright
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parents[1]/'dist'
js=next((root/'assets').glob('app-*.js'))
css=next((root/'assets').glob('styles-*.css'))
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
 errors=[]
 page.on('pageerror',lambda exc:errors.append(str(exc)))
 page.on('console',lambda msg:errors.append(msg.text) if msg.type=='error' else None)
 page.set_content('<!doctype html><html lang="pt-BR"><body><div id="root"></div></body></html>')
 page.add_style_tag(path=str(css))
 for v in ['react.production.min.js','react-dom.production.min.js','react16-compat.js']:page.add_script_tag(path=str(root/'vendor'/v))
 page.add_script_tag(path=str(js))
 assert page.locator('h1').inner_text()=='A ciência dos sinais.'
 assert page.locator('.module-card').count()==4
 print('PASS: dashboard com 4 módulos')
 page.locator('.side-nav').nth(1).click()
 assert page.locator('h1').inner_text()=='Eletroencefalografia'
 cb=page.locator('.topic-row input').first
 cb.check()
 assert cb.is_checked()
 page.locator('.study-aside textarea').fill('Nota de teste')
 print('PASS: estudo com checklist e diário')
 page.locator('.side-nav').nth(2).click()
 assert page.locator('canvas').count()==1
 page.locator('.lab-controls select').first.select_option('8')
 assert page.locator('.lab-controls select').first.input_value()=='8'
 page.locator('.toggle-pill').click()
 print('PASS: Canvas e controles do laboratório')
 page.locator('.side-nav').nth(5).click()
 assert page.locator('.report-editor textarea').count()==3
 page.locator('.report-editor textarea').first.fill('Aquisição demonstrativa')
 with page.expect_download() as info:page.get_by_role('button',name='Exportar .txt').click()
 assert info.value.suggested_filename.endswith('.txt')
 print('PASS: editor e exportação de laudo')
 page.locator('.side-nav').nth(6).click()
 with page.expect_download() as info:page.get_by_role('button',name='Baixar modelo de JSON').click()
 assert info.value.suggested_filename.endswith('.json')
 print('PASS: modelo de pacote e biblioteca')
 page.locator('.search-trigger').click()
 assert page.locator('.search-modal').count()==1
 page.locator('.modal-search input').fill('neurocondução')
 assert page.locator('.modal-result').count()>0
 page.locator('.modal-result').first.click()
 assert 'enmg' in page.url.lower()
 print('PASS: busca global e navegação')
 page.locator('.theme-btn').click()
 assert page.locator('html').get_attribute('data-theme')=='light'
 print('PASS: tema claro')
 page.set_viewport_size({'width':390,'height':844})
 page.locator('.menu-btn').click()
 assert 'sidebar-open' in page.locator('.sidebar').get_attribute('class')
 page.locator('.side-nav').first.click()
 assert page.locator('h1').inner_text()=='A ciência dos sinais.'
 print('PASS: navegação em celular')
 page.screenshot(path='/mnt/data/neurofisio-mobile-preview.png',full_page=True)
 assert not errors, 'ERROS DE EXECUÇÃO: '+json.dumps(errors,ensure_ascii=False)
 print('PASS: sem erros JavaScript')
 browser.close()
