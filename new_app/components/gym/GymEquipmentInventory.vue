<script setup lang="ts">
import { discoveryEquipment } from "~/utils/gymscan/discoveryEquipment";
import { en, sk } from '~/i18n/messages/gymDemo';
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
</script>
<template>
  <div class="gd-inventory is-shown">
    <div class="gd-inventory-title">
      <strong>{{ t('discovery.inventoryTitle') }}</strong><span>{{ t('discovery.city') }}</span>
    </div>
    <table>
      <caption class="sr-only">
        {{ t('discovery.inventoryCaption') }}
      </caption>
      <thead>
        <tr>
          <th scope="col">{{ t('discovery.equipment') }}</th>
          <th scope="col">{{ t('discovery.zone') }}</th>
          <th scope="col">{{ t('discovery.units') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in discoveryEquipment"
          :key="item.id"
          style="--row-reveal: 1"
        >
          <th scope="row">
            <img
              :src="item.poster"
              width="80"
              height="80"
              :alt="t(`discovery.equipmentNames.${item.id}`)"
              loading="lazy"
            /><span
              ><small>{{ item.number }} / {{ t(`discovery.equipmentTypes.${item.id}`) }}</small
              >{{ t(`discovery.equipmentNames.${item.id}`) }}</span
            >
          </th>
          <td>{{ item.area === 'Strength' ? t('discovery.areaStrength') : item.area === 'Cardio' ? t('discovery.areaCardio') : t('discovery.areaFreeWeights') }}</td>
          <td>1</td>
        </tr>
      </tbody>
    </table>
    <p class="gd-inventory-note">
      {{ t('discovery.inventoryNote') }}
    </p>
  </div>
</template>
