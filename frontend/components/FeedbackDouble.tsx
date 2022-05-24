import Slider from '@mui/material/Slider'

function CustomSlider({ name, label }: { name: string; label: string }) {
  return (
    <div className="feedback-row">
            <Slider 
        min={0}
        max={10}
        name={`${name}-1`}
        defaultValue={5}
        step={1}
        valueLabelDisplay="off"
        style={{ minWidth: "calc(40% - 60px)", margin: "0px 60px 32px 0px", fontSize: "0.8rem" }}
        marks={[
          { value: 0, label: "Not at all" },
          { value: 1, label: "" },
          { value: 2, label: "" },
          { value: 3, label: "" },
          { value: 4, label: "" },
          { value: 5, label: "Somewhat" },
          { value: 6, label: "" },
          { value: 7, label: "" },
          { value: 8, label: "" },
          { value: 9, label: "" },
          { value: 10, label: "Very much" }
        ]}
      />
      <div style={{ minWidth: "20%", textAlign: "center" }}><b>{label}</b></div>
      <Slider 
        min={0}
        max={10}
        name={`${name}-2`}
        defaultValue={5}
        step={1}
        valueLabelDisplay="off"
        style={{ minWidth: "calc(40% - 60px)", margin: "0px 0px 32px 60px", fontSize: "0.8rem" }}
        marks={[
          { value: 0, label: "Not at all" },
          { value: 1, label: "" },
          { value: 2, label: "" },
          { value: 3, label: "" },
          { value: 4, label: "" },
          { value: 5, label: "Somewhat" },
          { value: 6, label: "" },
          { value: 7, label: "" },
          { value: 8, label: "" },
          { value: 9, label: "" },
          { value: 10, label: "Very much" }
        ]}
        
      />
      <style jsx>{`
      .feedback-row {
        width: 100%;
        max-width: 100%;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        padding: 8px 40px;
        border-top: 1px solid rgb(233, 232, 229)
      }
    `}</style>
    </div>

  )
}

export default function FeedbackDouble() {

  return (
    <div>
      <div className="title-row">
        <div style={{ textAlign: "center", width: "calc(40% - 60px)", marginRight: "60px", fontWeight: 500 }}>
          Video A
        </div>
        <div style={{ textAlign: "center", width: "20%"}}>

        </div>
        <div style={{ textAlign: "center", width: "calc(40% - 60px)", marginLeft: "60px", fontWeight: 500 }}>
          Video B
        </div>
      </div>
      <CustomSlider name="confident" label="Confident" />
      <CustomSlider name="articulate" label="Articulate" />
      <CustomSlider name="positive" label="Upbeat" />
      <CustomSlider name="relatable" label="Relatable" />
      <CustomSlider name="focused" label="Focused" />
      <CustomSlider name="capable" label="Capable" />
      <CustomSlider name="experienced" label="Experienced" />
      <CustomSlider name="insightful" label="Insightful" />
      <style jsx>{`
        .title-row {
          width: 100%;
          max-width: 100%;
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          padding: 8px 40px;
        }
      `}</style>
    </div>
  )
}