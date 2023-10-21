let playerCardPick = 0;
playerTurn = true;

const GameModes = Object.freeze({ Easy: Symbol("easy"), Hard: Symbol("hard") });

const game = {
  deckSize: null,
  gameMode: null,
  playerPoints: 0,
  computerPoints: 0,
};

function resizeCardBasedOnScreenSize(cards) {
  var width = $("#playboard").width();
  var height = $("#playboard").height();
  var squareSide = Math.sqrt((((width * height) / 100) * 50) / cards);

  $(".card").css("width", squareSide);
  $(".card").css("height", squareSide);
}

/**
 * This method is activated by button click "Lets play!"
 */
function startGame() {
  let cardMode = $("input[type='radio'][name='card-radio']:checked");
  let gameMode = $("input[type='radio'][name='mode-radio']:checked");
  if (cardMode.length === 0) {
    //if there is no checked radio button
    $("#error-msg").text("Select deck size!");
  } else if (gameMode.length === 0) {
    $("#error-msg").text("Select game mode!");
  } else {
    $(
      "#game-mode, .info-text, #lets-play-button, #game-init-container"
    ).addClass("hidden");
    $("#playboard, #points-container, #back-button").removeClass("hidden");

    // getting the selected radio buttons value
    game.gameMode = getSelectedGameMode(gameMode[0].value);
    game.deckSize = cardMode[0].value;
    initGame(game.deckSize);
    resizeCardBasedOnScreenSize(game.deckSize);
  }
}

function getSelectedGameMode(gameModeValue) {
  switch (gameModeValue) {
    case "easy":
      return GameModes.Easy;
    case "hard":
      return GameModes.Hard;
  }
}
/**
 *
 * @param {Array} deck the deck containing the cards, the size depends on players choice in start
 */
function initGame() {
  let shuffledDeck = getShuffledDeck();
  for (let i = 0; i < game.deckSize; i++) {
    $("#playboard").append(
      "<div class='card-container'><div id='" +
        i +
        "'exposed=false cardtype='" +
        shuffledDeck[i] +
        "' class='card " +
        " upside-down-card'><div class='front' style='background-image: url(icons/" +
        shuffledDeck[i] +
        ".svg)'></div><div class='rear'></div></div></div>"
    );
  }
  setActionListeners();
}

function getShuffledDeck() {
  let deck = generateCards();
  let shuffledDeck = shuffleDeck(deck);
  return shuffledDeck;
}

function generateCards() {
  let arr = [];
  while (arr.length < game.deckSize / 2) {
    let generatedNumber = Math.floor(Math.random() * 16 + 1); // there is max 16 files
    if (arr.includes(generatedNumber)) {
      continue;
    } else {
      arr.push(generatedNumber);
    }
  }
  //all must have a pair
  return [...arr, ...arr];
}

function shuffleDeck(deck) {
  for (let i = 0; i < deck.length; i++) {
    let randomIndex = Math.floor(Math.random() * deck.length);
    let temp = deck[i];
    deck[i] = deck[randomIndex];
    deck[randomIndex] = temp;
  }
  return deck;
}

function setActionListeners() {
  // 1. Screen resize listener
  $(window).resize(function () {
    resizeCardBasedOnScreenSize(game.deckSize);
  });
  // 2. On click listener for the cards
  $(".card").on("click", (e) => {
    let selectedCard = $(`#${e.currentTarget.id}`); //getting the selected card by id
    if (
      selectedCard.hasClass("matched-card") ||
      selectedCard.hasClass("upside-up-card") ||
      !playerTurn
    ) {
      return;
    }
    playerCardPick++;
    // make the animation on clicked item
    turnAroundCard(selectedCard);

    // selectedCard.toggleClass("upside-up-card upside-down-card");
    // If there is 2 card selected, check for match
    if (playerCardPick % 2 == 0) {
      playerTurn = !playerTurn;
      setTimeout(() => {
        if (isTwoUpsideCardsMatch()) {
          game.playerPoints++;
          refreshPointTable();
          playerTurn = !playerTurn;
          if (isGameOver()) {
            endGame();
          }
        } else {
          computerTurn();
        }
      }, 1000);
    }
  });
  // 3. On click listener for Back button
  $("#back-button, #game-over-back-button").on("click", () => {
    $(
      "#game-mode, .info-text, #lets-play-button, #game-init-container"
    ).removeClass("hidden");
    $("#playboard, #points-container, #back-button, #game-over").addClass(
      "hidden"
    );
    resetGame();
  });

  //4. On click Play again button when game is over
  $("#play-again-button").on("click", () => {
    resetGame();
    $("#game-over").addClass("hidden");
    startGame();
  });
}

function refreshPointTable() {
  $("#player-points").text(game.playerPoints);
  $("#computer-points").text(game.computerPoints);
}

/**
 *
 * @returns {true|false} true if there is match, else false
 */
function isTwoUpsideCardsMatch() {
  let upsideCard1 = $(".upside-up-card:eq(0)");
  let upsideCard2 = $(".upside-up-card:eq(1)");

  // if mathces
  if (upsideCard1.attr("cardtype") == upsideCard2.attr("cardtype")) {
    upsideCard1.toggleClass("matched-card upside-up-card");
    upsideCard2.toggleClass("matched-card upside-up-card");
    return true;
  } else {
    turnAroundCard(upsideCard1);
    turnAroundCard(upsideCard2);
    return false;
  }
}

function isGameOver() {
  return getNonTurnedCards().length === 0;
}

function computerTurn() {
  setTimeout(function () {
    // getting a random card and that around twice,
    // wait one second after every turn to leave time
    // for the animation effect
    let pickedCard = $(`#${pickOne(getNonTurnedCards(), game.gameMode)}`);
    turnAroundCard(pickedCard);
    // pickedCard.toggleClass("upside-up-card upside-down-card");
    setTimeout(() => {
      // $(`#${getNonTurnedCards()[pickOne(getNonTurnedCards())]}`).toggleClass(
      //   "upside-up-card upside-down-card"
      // );
      let pickedCard = $(`#${pickOne(getNonTurnedCards(), game.gameMode)}`);

      turnAroundCard(pickedCard);

      setTimeout(() => {
        if (isTwoUpsideCardsMatch()) {
          game.computerPoints++;
          refreshPointTable();
          isGameOver() ? endGame() : computerTurn();
        } else {
          playerTurn = !playerTurn;
        }
      }, 1000);
    }, 1000);
  }, 1000);
}

function turnAroundCard(card) {
  card.toggleClass("upside-up-card upside-down-card");
  card.attr("exposed", true);
}

/**
 *@param {GameModes} gameMode
 * @param {Array} deck contains the upside-down-cards
 * @returns a random index number between 0 and decks length -1
 */
function pickOne(deck, gameMode) {
  let nonTurnedCards = getNonTurnedCards();
  if (gameMode === GameModes.Easy) {
    return nonTurnedCards[Math.floor(Math.random() * nonTurnedCards.length)];
  } else if (gameMode === GameModes.Hard) {
    let exposedCard = getExposedCard();
    if (exposedCard != null) {
      let id = $(`.card[cardtype="${exposedCard}"]:not(.upside-up-card)`).attr(
        "id"
      );
      return id;
    } else {
      return nonTurnedCards[Math.floor(Math.random() * nonTurnedCards.length)];
    }
  }
}

function getExposedCard() {
  let $cards = $(".card[exposed=true]:not(.matched-card)");
  let exposedCards = [];
  let exposedCardType = null;

  $.each($cards, function (indexInArray, valueOfElement) {
    let $oneCard = $(valueOfElement);
    if (exposedCards.includes($oneCard.attr("cardtype"))) {
      exposedCardType = $oneCard.attr("cardtype");
    } else {
      exposedCards.push($oneCard.attr("cardtype"));
    }
  });
  return exposedCardType;
}

function resetGame() {
  $(".card-container").remove();
  game.deckSize = null;
  game.gameMode = null;
  game.playerPoints = 0;
  game.computerPoints = 0;
  playerCardPick = 0;
  playerTurn = true;
  refreshPointTable();
}

function endGame() {
  if (game.playerPoints == game.computerPoints) {
    $("#winner").text("Draw!");
  } else if (game.playerPoints > game.computerPoints) {
    $("#winner").text("Player won the game!");
  } else {
    $("#winner").text("Computer won the game!");
  }
  $("#game-over").removeClass("hidden");
}

/**
 *
 * @returns {Array} returns an array containing the upside-down-cards.
 */
function getNonTurnedCards() {
  let actualDeck = [];
  $(".upside-down-card").map(function () {
    actualDeck.push($(this).attr("id"));
  });
  return actualDeck;
}

//TODO: Remove the item from actalDeck after pick, or refresh it
// Set a mute button
// set voices
// disable listeners while computers turn
