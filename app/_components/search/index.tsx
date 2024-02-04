'use client';

import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useState,
} from 'react';
import styles from './index.module.scss';
import { FACILITY_MAP, FacilityMap } from '@/const/facility';
import { INIT_PICKUP, PickUp } from '@/const/pickup';
import { ROOM_MAP, RoomMap } from '@/const/room';

type Props = {
  pickup: PickUp;
  setPickup: Dispatch<SetStateAction<PickUp>>;
};

const MAX_DISPLAY = 15;

// 文字列を半角,大文字に変換, ーをｰに変換, 、を,に変換, ひらがなをカタカナに変換
function toHankakuUpperCase(str: string) {
  return str
    .replace('ごう', '号')
    .replace('かん', '館')
    .replace(/ー/, '-')
    .replace(/、/, ',')
    .toUpperCase()
    .replace(/[Ａ-Ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    })
    .replace(/[ぁ-ん]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) + 0x60);
    });
}

export default function Search(props: Props) {
  const { pickup, setPickup } = props;

  const [searchWord, setSearchWord] = useState('');
  const [filterdFacility, setFilterdFacility] = useState([] as FacilityMap[]);
  const [filterdRoom, setFilterdRoom] = useState([] as RoomMap[]);

  function search(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    const searchWordSnap = toHankakuUpperCase(value);
    setSearchWord(value);

    if (searchWordSnap === '') {
      setFilterdFacility([]);
      setFilterdRoom([]);
      return;
    }

    const resFacility = FACILITY_MAP.filter((f) => {
      return f.name.includes(toHankakuUpperCase(searchWordSnap));
    });
    const resRoom = ROOM_MAP.filter((r) => {
      return r.room.includes(toHankakuUpperCase(searchWordSnap));
    });

    if (resFacility.length === 0 && resRoom.length === 0) return;

    setPickup(INIT_PICKUP);
    setFilterdFacility(resFacility);
    setFilterdRoom(resRoom);
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.key !== 'Enter') return;
    if (filterdFacility.length + filterdRoom.length !== 1) return;
    setPickup({
      facility: filterdFacility[0]?.id || filterdRoom[0]?.buildId || 0,
      room: filterdRoom[0]?.id || 0,
    });
  };

  return (
    <section className={styles.search_wrapper} id="search">
      <h2>
        <label htmlFor="search" className={styles.label}>
          施設・教室検索
        </label>
      </h2>
      <input
        type="text"
        className={styles.search}
        value={searchWord}
        onChange={search}
        onKeyDown={handleKeyDown}
      />

      <div className={styles.buttons}>
        {filterdRoom.slice(0, MAX_DISPLAY).map((r) => (
          <button
            key={r.room}
            className={`${styles.button} ${styles.room}`}
            data-active={pickup.room === r.id}
            onClick={() => setPickup({ facility: r.buildId, room: r.id })}
          >
            {r.room}({FACILITY_MAP.find((f) => f.id === r.buildId)?.name})
          </button>
        ))}
        {filterdRoom.length > MAX_DISPLAY && (
          <p>他{filterdRoom.length - 15}件...</p>
        )}
      </div>

      <div className={styles.buttons}>
        {filterdFacility.slice(0, MAX_DISPLAY).map((f) => (
          <button
            key={f.id}
            className={styles.button}
            data-active={pickup.facility === f.id}
            onClick={() => setPickup({ facility: f.id, room: 0 })}
          >
            {f.name}
          </button>
        ))}
        {filterdFacility.length > MAX_DISPLAY && (
          <p>他{filterdFacility.length - 15}件...</p>
        )}
      </div>
    </section>
  );
}
