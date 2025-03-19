import type {
  Castling,
  Color,
  DirectionIndex,
  File,
  ParsedGame,
  ParsedMove,
  Piece,
  Position,
  PositionIndex,
  Positions,
  PromotionPiece,
  Rank,
  Unoccupied,
} from './base'

import type {
  Includes,
  Int,
  IsLength,
} from './utils'

/** Format parsed game to fen notation */
export type FormatGame<T extends string> =
  IsLength<T, 64> extends false ? never : _FormatGame<T>

type _FormatGame<
  T extends string,
  Acc extends string = '',
  Count extends DirectionIndex = 0,
  Skip extends DirectionIndex = 0,
  Rank extends DirectionIndex = 0
> = Count extends 8
  ? _FormatGame<T, `${Acc}${Skip extends 0 ? '' : Skip}${Rank extends 7 ? '' : '/'}`, 0, 0, _Tick<Rank>>
  : Skip extends 8
    ? never
    : T extends `${infer Head}${infer Tail}`
      ? Head extends Piece
        ? _FormatGame<Tail, `${Acc}${Skip extends 0 ? '' : Skip}${Head}`, _Tick<Count>, 0, Rank>
        : _FormatGame<Tail, Acc, _Tick<Count>, _Tick<Skip>, Rank>
      : Acc

type _Tick<T extends DirectionIndex> =
  T extends 0 ? 1 :
  T extends 1 ? 2 :
  T extends 2 ? 3 :
  T extends 3 ? 4 :
  T extends 4 ? 5 :
  T extends 5 ? 6 :
  T extends 6 ? 7 : 8

/** stringify casting rights */
export type FormatCastling<
  T extends Castling,
  U = `${T['K'] extends true ? 'K' : ''}${T['Q'] extends true ? 'Q' : ''}${T['k'] extends true ? 'k' : ''}${T['q'] extends true ? 'q' : ''}`
> = U extends '' ? '-' : U

/** format san */
export type FormatSan<
  T extends ParsedMove,
> = `${Positions[T['from']]}${Positions[T['to']]}${T['promotion']}`

/** format tuple of sans */
export type ToSans<
  T extends ParsedMove[],
  Acc extends `${Position}${Position}${PromotionPiece | ''}`[] = []
> = T extends [infer U extends ParsedMove, ...infer V extends ParsedMove[]]
  ? ToSans<V, [...Acc, FormatSan<U>]>
  : Acc

/** Normalize fen board string to a 64 character string */
export type ParseBoard<
  T extends string,
  Acc extends string[] = []
> = T extends `${infer Head}${infer Rest}`
  ? Head extends '/' ? ParseBoard<Rest, [...Acc]> :
    Head extends '1' ? ParseBoard<Rest, [...Acc, Unoccupied]> :
    Head extends '2' ? ParseBoard<Rest, [...Acc, Unoccupied, Unoccupied]> :
    Head extends '3' ? ParseBoard<Rest, [...Acc, Unoccupied, Unoccupied, Unoccupied]> :
    Head extends '4' ? ParseBoard<Rest, [...Acc, Unoccupied, Unoccupied, Unoccupied, Unoccupied]> :
    Head extends '5' ? ParseBoard<Rest, [...Acc, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied]> :
    Head extends '6' ? ParseBoard<Rest, [...Acc, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied]> :
    Head extends '7' ? ParseBoard<Rest, [...Acc, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied]> :
    Head extends '8' ? ParseBoard<Rest, [...Acc, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied, Unoccupied]> :
    Head extends Piece ? ParseBoard<Rest, [...Acc, Head]> : never
  : Acc['length'] extends 64 ? Acc : never

/** Parse castling rights */
export type ParseCastling<T extends string> = {
  K: Includes<T, 'K'>
  Q: Includes<T, 'Q'>
  k: Includes<T, 'k'>
  q: Includes<T, 'q'>
}

/** Parse fen string */
export type ParseFen<T extends string, U =
  _ParseFen<T>> = U extends ParsedGame
    ? U['board'] extends never ? never
    : U['castling'] extends never ? never
    : U['ep'] extends never ? never
    : U['halfmove'] extends never ? never
    : U['fullmove'] extends never ? never
    : U['turn'] extends never ? never
    : U
  : never

export type _ParseFen<T extends string> =
  T extends `${infer _Board} ${infer _Turn} ${infer _Castling} ${infer _Ep} ${infer Halfmove} ${infer Fullmove}`
    ? {
      board: ParseBoard<_Board>
      ep: _Ep extends
        | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3'
        | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6'
        ? PositionIndex[_Ep]
        : _Ep extends '-'
          ? null
          : never
      halfmove: Int<Halfmove>
      fullmove: Int<Fullmove>
      castling: ParseCastling<_Castling>
      turn: _Turn extends Color ? _Turn : never
    }
  : never

/** Parse move notation */
export type ParseSan<T extends string> =
  T extends `${infer FromFile extends File}${infer FromRank extends Rank}${infer ToFile extends File}${infer ToRank extends Rank}${infer Promotion extends PromotionPiece | ''}`
    ? {
      from: PositionIndex[`${FromFile}${FromRank}`],
      to: PositionIndex[`${ToFile}${ToRank}`],
      promotion: Promotion extends PromotionPiece ? Promotion : ''
    }
    : never
