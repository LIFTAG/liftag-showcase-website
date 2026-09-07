<script setup lang="ts">
import { discoveryEquipment } from "~/utils/gymscan/discoveryEquipment";
</script>
<template>
  <div class="gd-inventory is-shown">
    <div class="gd-inventory-title">
      <strong>Your gym</strong><span>Bratislava</span>
    </div>
    <table>
      <caption class="sr-only">
        Example gym equipment in Bratislava
      </caption>
      <thead>
        <tr>
          <th scope="col">Equipment</th>
          <th scope="col">Zone</th>
          <th scope="col">Units</th>
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
              :alt="item.name"
              loading="lazy"
            /><span
              ><small>{{ item.number }} / {{ item.type }}</small
              >{{ item.name }}</span
            >
          </th>
          <td>{{ item.area }}</td>
          <td>1</td>
        </tr>
      </tbody>
    </table>
    <p class="gd-inventory-note">
      Example inventory · matched to the machines on this floor
    </p>
  </div>
</template>
