Ролики с советами для платформеров:

Общие правила:
1. [Правила хорошего платформера](https://www.youtube.com/watch?v=DmNMi7PG_yQ)
2. [Ultimate 2D Platformer Controller in Unity](https://www.youtube.com/watch?v=3sWTzMsmdx8&t=1s)
3. [5 tips for better platformer controls](https://www.youtube.com/watch?v=Bsy8pknHc0M)
4. [Improve Your Platformer with Forces | Examples in Unity](https://www.youtube.com/watch?v=KbtcEVCM7bw)
5. [Improve your Platformer with Acceleration | Examples in Unity](https://www.youtube.com/watch?v=KKGdDBFcu0Q)
6. [5 Reasons Your Indie Platformer Game Sucks!](https://www.youtube.com/watch?v=vFsJIrm2btU)
7. [Improve your Platformer’s Jump (and Wall Jump) | Unity](https://www.youtube.com/watch?v=2S3g8CgBG1g)
8. [Math for Game Programmers: Building a Better Jump](https://www.youtube.com/watch?v=hG9SzQxaCm8)

Статьи:
1. [The guide to implementing 2D platformers](http://higherorderfun.com/blog/2012/05/20/the-guide-to-implementing-2d-platformers/)


Двойной прыжок и прыжок от стены:
1. [HOW TO DOUBLE JUMP IN A PLATFORMER](https://gamemaker.io/en/tutorials/platformer-double-jump)
2. [The logic of Wall Sliding/Jumping and The Double Jump - Godot Tutorial - Now You Know Too](https://www.youtube.com/watch?v=mNTPh3Lz6zM)
3. [How To Wall Slide & Wall Jump In Unity](https://www.youtube.com/watch?v=O6VX6Ro7EtA)

---

Прыжок:
1. Буфер приземления. Запоминание нажатия прыжка. Перед тем как приземлится, игрок может нажать кнопку и по-хорошему персонаж должен прыгнуть.
2. Буфер прыжка. Coyote time. Делать буффер у прыжка, когда в начале падения в пропасть игрок может еще прыгнуть.
3. Когда варьируется высота прыжка, то не обнулять скорость по y, а умножать на 0.4, чтобы не резко прерывался прыжок.
4. Ограничивать скорость падания, если стало больше определенного значения.
5. Увеличить время нахождения в прыжке. Дать игроку больше пространства для маневра.
6. Когда игрок прыгает и ударяется головой об блок, то отодвигать его всторону если это позволяется. Использовать рейкасты, чтобы проверить можно ли подвинуть.
7. Когда игрок падает вниз, то увеличить множетель гравитации, чтобы он быстрее приземлялся.

Прыжок от стен:
1. Сделать фиксированную скорость падения, когда прислонился к стене.
2. По нажатию на прыжок от стены совершать прыжок. Обнулять значение двойного прыжка. Если прислонился к другой стене во время прыжка, то обнулять значения двойного прыжка.

Другое:
1. Делай размер области у опастных объектов меньше (шипы, враги), а у дружественных объектов больше (лестницы, предметы).