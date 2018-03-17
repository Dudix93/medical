
## Aplikacja mobilna do raportowania czasu przeznaczonego na projekty

  

Aplikacja powstała jako praca dyplomowa - inżynierska, w ramach stażu odbytego w firmie programistycznej "Transition Technologies". Pozwala ona na zarządzanie i raportowanie czasu spędzonego nad projektami w firmie, z podziałem na poszczególne czynności (np. programowanie, testowanie itp.). Aplikacja funkcjonuje w oparciu o połączenie z REST API, z którym następuje wymiana danych.

  

### Użyte technologie:

-  [Ionic](https://ionicframework.com/)

-  [Angular](https://angular.io/)

-  [Cordova](https://cordova.apache.org/)

-  [NodeJS](https://nodejs.org/)

-  [TypeScript](https://www.typescriptlang.org/)

### Prezentacja aplikacji:

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/err_logn.png) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/err_conn.png) |
|--|--|

  

>Ekran logowania.

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/ekran_glowny.png) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/zliczanie_manualne.png) |
|--|--|

>Ekran główny aplikacji, na którym użytkownik widzi projekty, do których jest zapisany. Z tego poziomu można zarządzać czynnościami, które są w trakcie wykonywania, a mianowicie:
- wstrzymać lub wznowić pracę nad czynnością (w zależności od metody zliczania)
- edytować czas przeznaczony na czynność (w zależności od metody zliczania) oraz opcjonalny komentarz
- zakończyć zliczanie czasu

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/czynnosci.png) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/metoda_zliczania.png) |
|--|--|

>Wybierając opcję "Rozpocznij czynność" wyświetlona zostaje lista czynności, dla danego projektu, nad którymi użytkownik jeszcze nie pracował oraz te które są w danej chwili dostępne (każda czynność ma określony czas dostępności, nie można wybrać tych nad którymi nie można jeszcze pracować), a następnie wybierana jest metoda zliczania czasu.

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/edit_manual.jpg) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/edit_autotask.jpg) |
|--|--|

>W zależności od aktywnej metody zliczania, możliwa jest edycja czasu oraz komentarza dla aktywnej czynności (zliczanie manualne) lub tylko komentarza w przypadku zliczania automatycznego.

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/dni.png) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/opcje_powiadomienia.png) |
|--|--|

>Użytkownik może sprecyzować, w które dni oraz w których godzinach pracuje. Na bazie tych danych wykonywane jest zliczanie automatyczne czasu. Ustawić też można indywidualne preferencje dotyczące powiadomień push aplikacji, takie jak:
- powiadomienie o nowej wiadomości wysłanej przez administratora API
- powiadomienie o aktywnym, automatycznym zliczaniu oraz interwał tych wiadomości
- powiadomienie o własnej treści, o ustalonej godzinie oraz dacie

 | ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/wiadomosci.jpg) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/wiadomosc.jpg) |
|--|--|

>Moduł obsługi wiadomości wysyłanych z serwera API. Każda nowa wiadomość zostaje zapisana w pamięci podręcznej na urządzeniu mobilnym.

![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/zakonczone_czynnosci.png)

>Jednym z założeń systemu jest uniemożliwienie bezpośredniej ingerencji w czas spędzony nad zakończonymi już przez użytkownika czynnościami. W tym celu powstała funkcjonalność, która umożliwia przejrzenie czasu wykonywania zakończonych czynności z podziałem na dni, jeśli trwało to dłużej niż jeden dzień roboczy. Z tego poziomu można dokonać korekty czasu oraz komentarza dla danej czynności. Wysyłana zostaje wtedy prośba na serwer API o dokonanie korekty.