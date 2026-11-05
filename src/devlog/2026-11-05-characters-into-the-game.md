---
title: Getting characters into the game
date: 2026-11-05
summary: How a character gets from Blender into Unity, and the small fixes that make clothes sit right.
---

Alongside the combat work, I've been bringing a big batch of character work into the game.

## Blender to Unity

The characters are made in **Blender** and the game is built in **Unity**, so every change to a character
means bringing it across again and hooking it back up: the materials, the animation, and what it can collide
with.

## What came across

This batch was a big one:

- **Six body frames**, from halfling-sized up to half-giant. Each race plays on its own body, so a dwarf
  really is shorter and broader, with its own reach and its own hitboxes (the invisible shapes the game
  checks a blade against).
- **Heads, faces, hair and beards.** Rather than a separate model for every face, a head carries **shape
  keys**: stored variations of the same model, like a wider jaw or a heavier brow, that can be dialled in and
  mixed. One head can become a lot of different faces. Body builds work the same way.
- **Skin tones**, painted onto the head and body when the character appears in the world.
- **Cloth on long hair and hanging beards**, so they swing as you move.
- **Clothes**: robes, cloaks, hoods, tunics and gambesons (padded cloth jackets, worn under armour or instead
  of it).

All of it is put together when your character appears, and it's shared with the other players, so everyone
sees the same character. In the character creator, you can step through all of it with a live 3D preview.

## The small stuff takes the longest

Most of the work is fixing the places where things don't quite fit. 3D clothes are thin shells over a body,
and when two of them overlap the wrong way you get **clipping**: one poking through the other. This round of
fixes:

- a hood that pinched in on the tunic's neckline
- elbows poking through the back of a cloak
- two small gaps at the top of a robe's undershirt
- a robe's shoulders sitting inside its own hood

Each fix happens back in Blender. Then the bodies are saved out again, imported again, and checked in the
game. It's slow, fiddly work, but it's the difference between a character that looks put together and one
that falls apart the moment it turns around.

## Next

Next is armour: around two hundred finished textures (the painted images wrapped around a 3D model) and the
materials that go with them, so each piece shows what it's made of.
