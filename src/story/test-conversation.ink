// ────────────────────────────────────────────────────────────────
// PLACEHOLDER conversation for engine testing (milestone M2).
// Not Episode 1 content — safe to delete once real scripts exist.
// Demonstrates: choices, gathers (re-convergence), variables,
// conditional blocks. Speaker lines use the "Name: text" convention.
// ────────────────────────────────────────────────────────────────

VAR fare = "unpaid"

-> crossing

=== crossing ===
The river at dusk. A flat-bottomed boat knocks against the ghat steps.
Ferryman: Last crossing of the night, traveler. You coming?
You: How much?
Ferryman: Two coins. Or one good story. I take either — the river takes both.
* [Pay the two coins.]
    ~ fare = "coins"
    You: Here. Two coins.
    Ferryman: Coin spends fast. Stories keep. Your loss.
* [Offer a story instead.]
    ~ fare = "story"
    You: Keep your fare. I'll pay in story.
    Ferryman: Ha! A gambler. Aboard, then — talk while I row.
* [Ask about the river first.]
    You: The water's high for this season, isn't it?
    Ferryman: Rains upstream. Or something older turning in its sleep. Two coins, same as ever.
    ~ fare = "coins"
    You: ...Two coins it is.
- The boat pushes off. Oars creak. The far bank is a smudge of lamplight.
-> midstream

=== midstream ===
Ferryman: Halfway. This is where the current argues.
{ fare == "story":
    Ferryman: Well? I'm still owed a story. Start talking.
    * [Tell of the churning of the ocean.]
        You: Then hear how the gods and the asuras churned the ocean of milk for amrita...
        Ferryman: Mm. Everyone tells that one. You tell it better than most.
        -> crossed
    * [Tell of the king who carried a corpse.]
        You: Then hear of Vikram, who carried a corpse that asked him riddles in the dark...
        Ferryman: Betaal's riddles! Now THAT is worth a crossing.
        -> crossed
    * [Admit you have no story.]
        You: ...I lied. I have no story worth the fare.
        Ferryman: Then you owe the river one. It collects, you know.
        -> crossed
- else:
    Ferryman: Quiet one, are you? Fine. The river does the talking out here.
    * [Watch the water.]
        You watch. Something long and slow moves beneath the surface. Probably a log.
        -> crossed
    * [Ask what he has seen out here.]
        You: You cross every night. What have you seen?
        Ferryman: Things I only talk about on land, friend.
        -> crossed
}

= crossed
The far bank arrives sooner than it should.
-> arrival

=== arrival ===
The hull grinds against sand. Lamps bob down the bank to meet the boat.
{ fare == "story":
    Ferryman: Fare's settled. That story buys the return trip too, if you ever need it.
- else:
    Ferryman: Coins in the box. Mind the step.
}
Ferryman: Whatever you came to this side for — find it before the rains do.
You step onto the bank. When you look back, the ferryman is already pulling away.
-> END
