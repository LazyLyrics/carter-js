import exp from 'constants';
import Carter from '../../index';
import { CarterSkill } from '../../types';
import * as helpers from '../helpers';
import dotenv from 'dotenv';
dotenv.config();

jest.setTimeout(60000);

describe('Skills', () => {
  let carter: Carter;
  let skillAuto: CarterSkill;
  let skillNonAuto: CarterSkill;
  let skillAutoNotGiven: CarterSkill;

  beforeEach(() => {
    const API_KEY = process.env.CARTER_API_KEY as string;
    carter = new Carter(API_KEY);
    expect(carter.skills).toHaveLength(0);
    skillAuto = {
      name: 'skillAuto',
      action: (response: string | null) => {
        const gotSomeDataBruv = {
          key: 'gotSomeDataBruv',
        };
        return { output: response || '', skillData: gotSomeDataBruv };
      },
      auto: true,
    };

    skillNonAuto = {
      name: 'skillNonAuto',
      action: (response: string | null) => {
        const gotSomeDataBruv = {
          key: 'gotSomeDataBruv',
        };
        return { output: response || '', skillData: gotSomeDataBruv };
      },
      auto: false,
    };

    skillAutoNotGiven = {
      name: 'skillAutoNotGiven',
      action: (response: string | null) => {
        const gotSomeDataBruv = {
          key: 'gotSomeDataBruv',
        };
        return { output: response || '', skillData: gotSomeDataBruv };
      },
    };
  });

  // REGISTER UNIQUE SKILLS - AUTO AND NOT
  test('should register unique skills with auto and non-auto options', () => {
    carter.registerSkill(skillAuto);
    carter.registerSkill(skillNonAuto);
    carter.registerSkill(skillAutoNotGiven);

    expect(carter.skills).toContainEqual(skillAuto);
    expect(carter.skills).toContainEqual(skillNonAuto);
    expect(carter.skills).toContainEqual(skillAutoNotGiven);
  });

  // REGISTER DUPLICATE SKILL
  test('should not register duplicate skills', () => {
    carter.registerSkill(skillAuto);
    expect(carter.skills).toContainEqual(skillAuto);
    expect(() => carter.registerSkill(skillAuto)).toThrow();

    const skillInstances = carter.skills.filter((s) => s.name === skillAuto.name);
    expect(skillInstances.length).toBe(1);
  });

  // REGISTER SKILL WITH NO NAME
  test('should not register skill with no name', () => {
    const skill = {
      action: (response: string) => response,
    };

    expect(() => carter.registerSkill(skill as any)).toThrow();
  });

  // TEST WITH INVALID ACTION
  test('should not register skill with invalid action', () => {
    const skill = {
      name: 'invalidActionSkill',
      action: 1,
    };

    expect(() => carter.registerSkill(skill as any)).toThrow();
  });

  // FIND PRESENT SKILL
  test('should find the present skill', () => {
    carter.registerSkill(skillAuto);

    const foundSkill = carter.findSkill(skillAuto.name);
    expect(foundSkill).toEqual(skillAuto);
  });

  // FIND ABSENT SKILL
  test('should return undefined for the absent skill', () => {
    const absentSkillName = 'absentSkill';
    const foundSkill = carter.findSkill(absentSkillName);
    expect(foundSkill).toBeUndefined();

    carter.registerSkill(skillAuto);
    const foundSkill2 = carter.findSkill(absentSkillName);
    expect(foundSkill2).toBeUndefined();
  });

  // FORGET TO PASS NAME
  test('should not find skill if name is not passed', () => {
    carter.registerSkill(skillAuto);
    expect(() => carter.findSkill(undefined as any)).toThrow();
  });

  // FORCED BEHAVIOUR TESTS
  test('should trigger forced behaviours', async () => {
    const weatherSkill = {
      name: 'weather',
      action: (response: string | null) => {
        return { output: 'WEATHER' };
      },
      auto: true,
    };
    carter.registerSkill(weatherSkill);

    const newsSkill = {
      name: 'news',
      action: (response: string | null) => {
        return { output: 'NEWS' };
      },
    };
    carter.registerSkill(newsSkill);

    const responseWeather = await carter.say('Tell me the weather', 'testid');
    helpers.expectSuccessfulCarterInteraction(responseWeather);
    expect(responseWeather.forcedBehaviours).toEqual([{ name: 'weather' }]);
    console.log(
      '🚀 ~ file: skills.jest.ts:140 ~ test ~ responseWeather.forcedBehaviours:',
      responseWeather.forcedBehaviours,
    );
    expect(responseWeather.outputText).toEqual('WEATHER');
    expect(responseWeather.carterData?.output.text).toEqual('WEATHER');

    const responseNews = await carter.say('Tell me the news', 'userId');
    helpers.expectSuccessfulCarterInteraction(responseNews);
    expect(responseNews.forcedBehaviours).toEqual([{ name: 'news' }]);
  });
});
