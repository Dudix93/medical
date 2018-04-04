
## Aplikacja mobilna do raportowania czasu przeznaczonego na projekty

## Mobile application which monitors and reports time spent on the project
  
## [PL]
Aplikacja powstała jako praca dyplomowa - inżynierska, w ramach stażu odbytego w firmie programistycznej "Transition Technologies". Pozwala ona na zarządzanie i raportowanie czasu spędzonego nad projektami w firmie, z podziałem na poszczególne czynności (np. programowanie, testowanie itp.). Aplikacja funkcjonuje w oparciu o połączenie z REST API, z którym następuje wymiana danych.

 ## [EN]
The following app has been developed as a part of engineering thesis, during an internship in an software programming company called "Transition Technologies". It allows to count and report time spent on the projects in the company, divided into single tasts (for instance programming, testing ect.). The app works in connection with external a REST API server which is used to exchange data. 

### Użyte technologie/Powered by:

-  [Ionic](https://ionicframework.com/)

-  [Angular](https://angular.io/)

-  [Cordova](https://cordova.apache.org/)

-  [NodeJS](https://nodejs.org/)

-  [TypeScript](https://www.typescriptlang.org/)

### Prezentacja aplikacji/Main functionalities:

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/err_logn.png) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/err_conn.png) |
|--|--|

  

>Ekran logowania/Login screen.

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/ekran_glowny.png) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/zliczanie_manualne.png) |
|--|--|

### [PL]
>Ekran główny aplikacji, na którym użytkownik widzi projekty, do których jest zapisany. Z tego poziomu można zarządzać czynnościami, które są w trakcie wykonywania, a mianowicie:
- wstrzymać lub wznowić pracę nad czynnością (w zależności od metody zliczania)
- edytować czas przeznaczony na czynność (w zależności od metody zliczania) oraz opcjonalny komentarz
- zakończyć zliczanie czasu

### [EN]
>The main screen which shows projects assigned to user. It allows user to perform various actions with tasks, which are currently in progress, which are:
- pausing or resuming task's time counting (depends on counting method)
- ability to edit task's time which has been spent (depends on counting time) and an optional comment
- finishing the process of time counting

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/czynnosci.png) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/metoda_zliczania.png) |
|--|--|

### [PL]
>Wybierając opcję "Rozpocznij czynność" wyświetlona zostaje lista czynności, dla danego projektu, nad którymi użytkownik jeszcze nie pracował oraz te które są w danej chwili dostępne (każda czynność ma określony czas dostępności, nie można wybrać tych nad którymi nie można jeszcze pracować), a następnie wybierana jest metoda zliczania czasu (manualna albo automatyczna).

### [EN]
>By choosing "Rozpocznij czynność" (which stands for "Start task" since the app doesn't suppport english language so far), the user can display the list of tasks which haven't been done yet and what is more, the ones which are available in this moment since every task has it's own peroid of time during which it can be assigned to the user. The next step is choosing the counting method (manual or automatic one).

| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/edit_manual.jpg) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/edit_autotask.jpg) |
|--|--|

### [PL]
>W zależności od aktywnej metody zliczania, możliwa jest edycja czasu oraz komentarza dla aktywnej czynności (zliczanie manualne) lub tylko komentarza w przypadku zliczania automatycznego.

### [EN]
>Depending on active counting method, it's possible to edit time and comment for current task (manual counting method) or comment only (automatic counting method).
| ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/dni.png) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/opcje_powiadomienia.png) |
|--|--|

### [PL]
>Użytkownik może sprecyzować, w które dni oraz w których godzinach pracuje. Na bazie tych danych wykonywane jest zliczanie automatyczne czasu. Ustawić też można indywidualne preferencje dotyczące powiadomień push aplikacji, takie jak:
- powiadomienie o nowej wiadomości wysłanej przez administratora API
- powiadomienie o aktywnym, automatycznym zliczaniu oraz interwał tych wiadomości
- powiadomienie o własnej treści, o ustalonej godzinie oraz dacie

### [EN]
>The user can choose working hours and in which days he/she works. The automatic counting method rely on these data. It's possible to set a personal preferences about receiving push notifications, such as:
- notification about new message sent by API's administrator
- notification about automatic counting which is currently in progress as well as it's interval
- own notification with own message to show on particular date and time

 | ![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/wiadomosci.jpg) |![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/wiadomosc.jpg) |
|--|--|

### [PL]
>Moduł obsługi wiadomości wysyłanych z serwera API. Każda nowa wiadomość zostaje zapisana w pamięci podręcznej na urządzeniu mobilnym.

### [EN]
>The functionality which allows to manage messages sent from API server. Each of them is saved into mobile device's internal storage.

![enter image description here](https://github.com/Dudix93/raportowanie/blob/api2/screenshots/zakonczone_czynnosci.png)

### [PL]
>Jednym z założeń systemu jest uniemożliwienie bezpośredniej ingerencji w czas spędzony nad zakończonymi już przez użytkownika czynnościami. W tym celu powstała funkcjonalność, która umożliwia przejrzenie czasu wykonywania zakończonych czynności z podziałem na dni, jeśli trwało to dłużej niż jeden dzień roboczy. Z tego poziomu można dokonać korekty czasu oraz komentarza dla danej czynności. Wysyłana zostaje wtedy prośba na serwer API o dokonanie korekty.

### [EN]
>One of the system's restrictions is not allowing user from changing time report which has already been saved into server. In this case, if such change has to be done, there is an separate functionality which allows to manage time spent on each finished task, divided into single days (if choosen task has been in progress longer than one day). The following funcionality allows to change time under the day of choice as well as task's comment. Later on after applying changes, a request is send to the API's server to make a change.