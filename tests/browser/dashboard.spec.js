import {test,expect} from '@playwright/test';
test('Roles, slice filters, metric detail, empty states and export work',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByRole('heading',{name:'Найм в цифрах.'})).toBeVisible();
 await expect(page.locator('.kpi-value').first()).toHaveText('83%');
 await page.locator('.kpi').first().click();await expect(page.getByRole('dialog')).toContainText('Действия при отклонении');
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByLabel('Направление',{exact:true}).selectOption('ML');await expect(page.locator('.kpi-value').first()).toHaveText('100%');
 await page.getByLabel('Грейд',{exact:true}).selectOption('Middle');await expect(page.getByText('Нет данных для этого среза')).toBeVisible();
 await page.getByRole('button',{name:'Показать все данные'}).click();
 await page.getByRole('button',{name:/Нанимающий руководитель/}).click();await expect(page.getByRole('heading',{name:'Вакансии и решения.'})).toBeVisible();
 await page.getByRole('button',{name:'Детали: Tech Lead ML'}).click();await expect(page.getByRole('dialog')).toContainText('Подтвердить финальное интервью');await page.getByRole('button',{name:'Закрыть',exact:true}).click();
 await page.getByLabel('Поиск вакансии').fill('zzzz');await expect(page.getByText('Вакансии не найдены. Измените поиск или фильтры.')).toBeVisible();
 await page.getByRole('button',{name:'Рекрутмент Воронка и процессы'}).click();await page.getByLabel('Направление',{exact:true}).selectOption('all');
 await expect(page.getByRole('heading',{name:'Источники кандидатов'})).toBeVisible();
 await page.getByLabel('Период',{exact:true}).selectOption('september');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Выгрузить CSV'}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('MWS-hiring-september.csv');
 await page.reload();await expect(page.getByLabel('Период',{exact:true})).toHaveValue('september');await expect(page.getByRole('heading',{name:'Воронка и узкие места.'})).toBeVisible();
 await page.getByRole('button',{name:'Методика и источники'}).click();await expect(page.getByRole('dialog')).toContainText('Использование ИИ');await page.getByRole('button',{name:/Скорость этапов/}).click();await expect(page.getByRole('dialog')).toContainText('Медиана рабочих дней');
 expect(errors).toEqual([]);
});
test('Desktop and mobile layout and screenshots',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await page.goto('/');await expect(page.locator('.kpi')).toHaveCount(5);
 await page.screenshot({path:'/tmp/mws-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/mws-mobile.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:/Нанимающий руководитель/}).click();await expect(page.getByRole('heading',{name:'Вакансии и решения.'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
