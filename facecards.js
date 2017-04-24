"use strict";

const pageWidth = 98;
const pageHeight = 148;
const cardWidth = 49;
const cardHeight = 74;
const cardBackCoverURL = "background.png";
const cardRadius = 0.5;

const fontFamily = "Ubuntu";
const baseFontSize = 8.5;

let svg = SVG("drawing").size(0, 0);
let cardCover = svg.rect(cardWidth, cardHeight).radius(cardRadius);

const cardCoverClip = svg.clip().add(cardCover);
const cardBackCoverPattern = svg.pattern(cardWidth, cardHeight, function(add) {
    add.image(cardBackCoverURL, cardWidth, cardHeight).attr({ preserveAspectRatio: 'xMidYMid slice' })
});


function createPage() {
    let svg = SVG("drawing").size(pageWidth + "mm", pageHeight + "mm").viewbox(0, 0, pageWidth, pageHeight);
    let page = svg.group();
    return page;
}

function createCardBack(faceCard) {
    let cardBack = new SVG.G();
    cardBack.attr({ class: "card-back" });
    cardBack.rect(cardWidth, cardHeight).radius(cardRadius);
    cardBack.rect(cardWidth, cardHeight).fill(cardBackCoverPattern).clipWith(cardCoverClip);

    let name = faceCard.name.split(" ");
    cardBack.text(function(add) {
        add.tspan(name[0]).attr({ class: 'first-name' }).newLine();
        add.tspan(name[1]).attr({ class: 'last-name', "font-size": baseFontSize * 1 }).newLine();
    }).move(cardWidth * 0.5, cardHeight * 0.2).font({
        family:   fontFamily,
        size:     baseFontSize,
        anchor:   'middle',
        leading:  '1.2em'
    });

    let socialLink = faceCard.socialLinks.github ? faceCard.socialLinks.github : faceCard.socialLinks.twitter;

    if (socialLink) {
        let text = cardBack.text(socialLink).attr({ class: "social-link" }).move(cardWidth * 0.5, cardHeight * 0.8).font({
            family:   fontFamily,
            size:     baseFontSize * 0.55,
            anchor:   'middle',
            leading:  '1.2em'
        });
    }

    return cardBack;
}

function createCardFront(faceCard) {
    let cardFront = new SVG.G();
    cardFront.attr({ class: "card-front" });

    let photo = cardFront.image(faceCard.photo, cardWidth, cardHeight).move(0, 0).attr({ preserveAspectRatio: 'xMidYMax slice' });
    photo.clipWith(cardCoverClip);

    return cardFront;
}

const foldm = (array, groupSize) => array.reduce((acc, val, i, array) => !(i % groupSize) ? acc.concat([array.slice(i, i + groupSize)]) : acc, []);

function fillPage(rows, cardBuilder, directOrder) {
    let draw = createPage();

    rows.forEach((row, y) => {
        row.forEach((faceCard, x) => {
            let card = cardBuilder(faceCard);
            let index = (directOrder) ? x : (row.length - x - 1);
            card.move(index * cardWidth, y * cardHeight);
            draw.add(card);
        });
    });
}

function createDeck(faceCards) {
    let cardsPerRow = Math.floor(pageWidth/cardWidth);
    let cardsPerColumn = Math.floor(pageHeight/cardHeight);
    let cardsPerPage = cardsPerColumn * cardsPerRow;

    let cardPages = foldm(faceCards, cardsPerPage);
    cardPages.forEach(group => {
        let rows = foldm(group, cardsPerRow);

        fillPage(rows, createCardFront, true);
        fillPage(rows, createCardBack, false);
    });
}