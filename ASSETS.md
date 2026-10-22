# Материалы Pinehaven

Все фотографии созданы встроенным ImageGen специально для проекта. Интерфейс и тексты являются настоящим HTML, а не частью изображения.

| Файл | Роль |
| --- | --- |
| plate.webp | Чистый фон первого экрана без игрока |
| subject.webp | Игрок и клюшка с настоящим alpha-каналом; 89.55% исходных пикселей прозрачны |
| hero.webp | Исходный полный кадр для дальнейшей работы со слоями |
| walk.webp | Два друга на поле с тележками |
| putt.webp | Крупный план мяча и лунки |
| lesson.webp | Индивидуальное занятие с тренером |
| clubhouse.webp | Современный клубный дом с террасой |
| terrace-v2.webp | Стол на солнечной террасе |
| landscape-v2.webp | Панорама поля у озера, фотографический переход и заключительная секция |
| holes/hole-01.webp … hole-18.webp | 18 различных концептуальных видов лунок с высоты |
| clubhouse-exterior-v3.webp | Новый фасад клубного дома у грина |
| clubhouse-lounge-v3.webp | Интерьер гостиной с панорамными окнами и камином |

Изображения лежат в assets/images/. Генератор изменил рамку вырезки subject; масштаб и положение согласованы при композитинге в CSS и проверены в браузере. Передний и задний планы используют общий контакт с землёй; для телефона задано отдельное кадрирование.

Шрифт Manrope Variable получен из официального Google Fonts, ofl/manrope/Manrope[wght].ttf. Лицензия SIL Open Font License: assets/fonts/OFL.txt. Внешние загрузки шрифтов и изображений при просмотре не нужны. Виды лунок сгенерированы, линии игры и карта написаны как SVG. Все эти изображения концептуальные и не предназначены для реальной навигации.

## Промпты
### hero

Photorealistic editorial golf resort photograph, landscape 1536x1024, no text, no logos, no graphics, no watermark. Large beautiful forest golf course in northern Europe, lush striped fairway receding into tall Scots pines and white birch woodland, a hint of distant lake and soft hills. Pale blue clear morning sky occupies top 45 percent of frame, forest canopy low center and taller at left/right edges. One single male golfer seen from behind at right x=78 percent, elegant navy knit polo and pale stone golf trousers, finishing a drive with golf club held over shoulder to left, head at y=36 percent and shoes at y=90 percent. Athletic realistic anatomy, entire person and club fully visible, no other people. Camera on tee behind player, natural soft sunlight from left, quiet luxury authentic documentary shot, rich natural greens and cool blue, high detail, no oversaturation. This exact photograph will be composited into separate background and alpha foreground planes, keep clean edges and clear sky behind upper body.

### clubhouse

Photorealistic editorial architectural and lifestyle photograph at a fictional northern European forest golf club. Landscape 1536x1024, no text/logos/watermark. Contemporary low pavilion of warm timber, pale limestone and large glass windows, secluded between tall Scots pines, terrace with a few golfers having lunch, understated natural materials, quiet luxury without ostentation. View from lawn through a nearby pine trunk at one edge, soft late morning sun, fresh true greens, white linen and navy clothing, same world as a pine forest golf course. Architectural photography, not a mansion, natural human details.

### lesson

Photorealistic documentary editorial photograph at a premium but welcoming northern European forest golf club. Landscape 1536x1024. One friendly female professional coach in navy polo helping a beginner woman in a white golf top with her grip, both shown from 3/4 side with upper bodies and clubs, on a short-game practice green surrounded by Scots pines and white birches. Warm rapport, authentic candid moment, natural realistic faces and hands, soft morning sunlight, fresh green and restrained navy/white palette, no text no graphics no logos no watermark.

### walk

Photorealistic fine editorial golf photograph, landscape 1536x1024. Two friends walking away down the right side of a striped fairway with small golf trolleys, tall Scots pines and silver birch framing the path, their understated navy/white/stone golf clothing. Large quiet negative space of green grass, slight morning haze, northern European woodland golf course, welcoming calm premium atmosphere, natural body proportions, candid documentary realism. No text, no logo, no graphics, no watermark.

### putt

Photorealistic editorial close-up photograph, landscape 1536x1024. White dimpled golf ball on carefully cut vivid but natural putting green, at lower center-left near a cup with slender dark green flagstick. Small long soft shadow, tactile grass texture, distant pine trees softly out of focus, gentle morning sunlight, low camera angle, quiet luxury golf magazine photography. No text no logo no graphics no watermark.

## Разделение исходного hero

Plate: удалить только игрока и клюшку, восстановить ландшафт, сохранить перспективу и свет.
Subject: извлечь только игрока и всю клюшку на настоящий прозрачный фон, сохранить позу и свет. Фактическое выравнивание проверено в готовой композиции.

Фотографии с референсного сайта в поставку не включены.
