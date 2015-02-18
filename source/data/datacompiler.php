<?php
class Compiler
{
    protected $dataDirectory;
    protected $currentWeekDataFolder;
    protected $previousWeekDataFolder;
    protected $currentWeekData;
    protected $previousWeekData;
    protected $englandData;
    protected $excludedFromBarGraph = array();
    protected $config;
    protected $weekIndex;
    protected $datacfg;
    protected $weeklyAeSitrep;
    protected $winterPressures;

    public function __construct() {
        $this->dataDirectory = dirname(__FILE__);
        $this->config = json_decode(file_get_contents($this->dataDirectory . '/config.json'));

        $this->weekIndex = $this->config->weekIndex;
        $datacfg = $this->config->data->{'week' . $this->weekIndex};

        $this->executeRScript('weeklyAeSitrep', $datacfg->weeklyAeSitrepDataUrl);
        $this->executeRScript('winterPressuresDailySitrep', $datacfg->winterPressuresDataUrl);

        if ($this->weekIndex > 0) {
            $this->currentWeekDataFolder = 'week' . $this->weekIndex;
            $this->previousWeekDataFolder = 'week' . ($this->weekIndex - 1);
            $this->currentWeekData = $this->getJson($this->currentWeekDataFolder);
            $this->previousWeekData = $this->getJson($this->previousWeekDataFolder, $this->previousWeekDataFolder);
            $this->englandData = $this->getJson($this->currentWeekDataFolder, 'weekly_england_sitrep');
            if ($this->weekIndex === 1) {
                // set up data schema
                $this->createDataSchema();
                /* make sure the source csv is updated prior to running it */
                self::buildIdMapping();
            }
            $this->compileData();
            $this->writeTemplateValuesIncludes($datacfg);
        }
    }

    protected function createDataSchema() {
        $dataSchema = array(
            "patients_waiting_over_4hrs_tobe_admitted" => array(),
            "trolley_wait_4_to_12hrs" => array(),
            "total_ambulances_queuing" => array(),
            "ambulances_queuing" => array(),
            "planned_operations" => array(),
            "beds_blocked" => array(),
            "beds_closed_dueto_norovirus" => array(),
            "week_performance_chart" => array()
        );

            foreach($this->currentWeekData as $trust => $trustData) {
                if ($trust !== england) {
                    $dataSchema[$trust] = array(
                        "name" => trim($trustData['name']),
                        "attendances_at_ane" => array(),
                        "emergency_admissions" => array(),
                        "patients_waiting_over_4hrs_tobe_admitted" => array(),
                        "patients_seen_in_four_hours" => array(),
                        "trolley_wait_4_to_12hrs" => array(),

                        "ambulances_queuing" => array(),
                        "planned_operations" => array(),
                        "beds_blocked" => array(),
                        "beds_closed_dueto_norovirus" => array()
                    );
                }
            }
        file_put_contents("{$this->dataDirectory}/{$this->previousWeekDataFolder}/{$this->previousWeekDataFolder}.json", json_encode($dataSchema, true));
    }

    public static function buildIdMapping() {
        $data_file_handle = fopen(dirname(__FILE__) . "/source_assets/id_mapping.csv", "r");
        $data_array = array();
        if ($data_file_handle !== false) {
            while(($data = fgetcsv($data_file_handle, 10000, ',')) !== false) {
                // print "is line \n";
                if ($data[0] !== 'map_code') {
                    $data_array[$data[0]] = array('name' => $data[1], 'trust' => $data[2]);
                }
            }
        }
        
        file_put_contents(dirname(__FILE__) . "/../js/data/id_mapping.js", 'define(' . json_encode($data_array, true) . ');');
    }

    public function getJson($folder, $filename = 'weekly_ae_sitrep') {
        $json_path = "$this->dataDirectory/{$folder}/{$filename}.json";
        return json_decode(file_get_contents($json_path), true);
    }

    public function writeTemplateValuesIncludes($datacfg) {
        file_put_contents($this->dataDirectory . '/../tmpl/includes/app/nations/patientsSeenIn4HrsMajorAE.tmpl', $datacfg->patientsSeenIn4HrsMajorAE);
        file_put_contents($this->dataDirectory . '/../tmpl/includes/app/nations/dirPatientsSeenIn4HrsMajorAE.tmpl', $datacfg->dirPatientsSeenIn4HrsMajorAE);
        file_put_contents($this->dataDirectory . '/../tmpl/includes/app/nations/patientsSeenIn4HrsAllAE.tmpl', $datacfg->patientsSeenIn4HrsAllAE);
        file_put_contents($this->dataDirectory . '/../tmpl/includes/app/nations/dirPatientsSeenIn4HrsAllAE.tmpl', $datacfg->dirPatientsSeenIn4HrsAllAE);
    }

    public function executeRScript($dataset, $datasetUrl) {
        try {
            echo "\nProcessing {$dataset}: " . $datasetUrl;
            var_dump($dataset, $this->dataDirectory);
            exec("Rscript {$this->dataDirectory}/{$dataset}.R $this->weekIndex $datasetUrl $this->dataDirectory", $output, $return_var);
            if ($return_var === 1) {
                exit;
            }
        } catch (Exception $e) {
            var_dump($e->message); exit;
        }

        foreach ($output as $line) {
            var_dump($line);
        }


    }

    public function compileData() {

        $patientsSeenIn4Hours = array();

        foreach ($this->previousWeekData as $trust => &$trustData) {
            if (!in_array($trust, $this->excludedFromBarGraph)) {
                if (strlen($trust) < 4) {

                    $patientsSeenIn4Hours[$trust] = (float) trim($this->currentWeekData[$trust]['patients_seen_in_four_hours']);
                    foreach($trustData as $variable => $value) {
                        if ($variable !== 'name') {
                            $trustData[$variable][] = (float) trim($this->currentWeekData[$trust][$variable]);
                        }
                    }
                } else {
                    if ($trust !== 'week_performance_chart') {
                        $trustData[] = (float) trim($this->englandData[$trust]);
                    }
                }

            }
        }

        asort($patientsSeenIn4Hours);
        $this->previousWeekData['week_performance_chart'] = array();

        foreach ($patientsSeenIn4Hours as $trustCode => &$patientsSeenIn4hrs) {
            if ($trustCode !== 'code' && !in_array($trustCode, $this->excludedFromBarGraph)) {
                $this->previousWeekData['week_performance_chart'][] = array($trustCode, $patientsSeenIn4hrs);
            }
        }

        echo "\n...writing out data file (json)\n";
        file_put_contents("{$this->dataDirectory}/{$this->currentWeekDataFolder}/{$this->currentWeekDataFolder}.json", json_encode($this->previousWeekData, true));
        file_put_contents(dirname(__FILE__) . "/../js/data/dataset.js", 'define(' . json_encode($this->previousWeekData, true) . ');');

    }
}

$compiler = new Compiler((int) $weekIndex);

?>